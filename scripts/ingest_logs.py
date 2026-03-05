#!/usr/bin/env python3
"""
Efficient log ingestion script that streams entries directly to stdout.
No temp files, no memory accumulation - pure streaming for maximum performance.

Usage:
    python ingest_logs.py <basePath>

Output:
    Streams JSONL to stdout (one entry per line)
    Final stats on last line prefixed with "STATS:"
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Generator, Optional, Tuple

class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'

# Pre-compile regex patterns for performance
import re
TIMESTAMP_PATTERN = re.compile(r'Timestamp:\s*(.+?)(?:\s*\(|$)')
SEVERITY_PATTERN = re.compile(r'Severity:\s*(\w+)', re.IGNORECASE)
ERROR_TYPE_PATTERN = re.compile(r'([\w\.]+Exception)', re.IGNORECASE)
ERP_ERROR_PATTERN = re.compile(r'ERP Error:\s*(.+)', re.IGNORECASE)
ERP_REQUEST_PATTERN = re.compile(r'ERP request:\s*([^\n<]+)', re.IGNORECASE)
OPERATION_PATTERN = re.compile(r'<Operation>([^<]+)</Operation>', re.IGNORECASE)
MESSAGE_PATTERN = re.compile(r'Message:\s*([^\n]+(?:\n(?!Severity:|Category:|Website:).+)*)', re.IGNORECASE)
ERRORS_PATTERN = re.compile(r'<Errors>([\s\S]*?)</Errors>', re.IGNORECASE)
ERROR_TAG_PATTERN = re.compile(r'<Error[^>]*>([^<]+)</Error>', re.IGNORECASE)

CUSTOMER_PATTERNS = [
    re.compile(r'Customer\s*ID\s*[:=]\s*([A-Za-z0-9_-]+)', re.IGNORECASE),
    re.compile(r'CustomerId\s*[:=]\s*([A-Za-z0-9_-]+)', re.IGNORECASE),
    re.compile(r'Customer\s*No\.?\s*[:=]\s*([A-Za-z0-9_-]+)', re.IGNORECASE),
    re.compile(r'SoldTo\s*[:=]\s*([A-Za-z0-9_-]+)', re.IGNORECASE),
    re.compile(r'Account\s*ID\s*[:=]\s*([A-Za-z0-9_-]+)', re.IGNORECASE),
]


def extract_metadata_from_path(file_path: str, base_path: str) -> Tuple[str, str]:
    try:
        rel_path = Path(file_path).relative_to(base_path)
        path_parts = rel_path.parts
        
        country = 'unknown'
        environment = 'PROD'
        
        if len(path_parts) > 0:
            country = path_parts[0].lower().replace('-', '_').split('-')[0]
        
        if len(path_parts) > 1:
            env_candidate = path_parts[1].upper()
            if env_candidate in ['PROD', 'INDUS', 'TEST', 'DEV']:
                environment = env_candidate
        
        if '-' in path_parts[0]:
            parts = path_parts[0].split('-')
            if len(parts) >= 2:
                country = parts[0].lower()
                if parts[1].upper() in ['PROD', 'INDUS', 'TEST', 'DEV']:
                    environment = parts[1].upper()
        
        return country, environment
    except:
        return 'unknown', 'PROD'


def parse_timestamp(timestamp_str: str) -> Optional[datetime]:
    try:
        return datetime.strptime(timestamp_str, '%m/%d/%Y %H:%M:%S')
    except ValueError:
        return None


def extract_error_type(message: str) -> str:
    lower = message.lower()

    if 'exception' in lower:
        match = ERROR_TYPE_PATTERN.search(message)
        if match:
            return match.group(1)

    if 'erp error:' in lower:
        match = ERP_ERROR_PATTERN.search(message)
        if match:
            return match.group(1).strip()[:100]

    if message:
        parts = message.split('\n', 1)
        first = parts[0].split(':', 1)[0].strip()
        return (first[:100] + ('...' if len(first) > 100 else '')) if first else 'N/A'

    return 'N/A'


def classify_error_category(error_type: str, message: str) -> str:
    error_text = f"{error_type} {message}".lower()

    data_keywords = [
        'recordnotfound', 'not found', 'null', 'cannot find', 'does not exist',
        'invalid', 'missing', 'not exist', 'cannot initialize', 'validation',
        'incorrect', 'malformed', 'format', 'parse', 'deserialize', 'duplicate',
        'constraint', 'unique', 'primary key', 'foreign key', 'type mismatch'
    ]

    system_keywords = [
        'connection', 'timeout', 'exception', 'fatal', 'crash', 'memory',
        'permission', 'denied', 'unauthorized', 'forbidden', 'internal',
        'server error', 'service', 'unavailable', 'network', 'socket',
        'endpoint', 'http', 'communication', 'serialization', 'deadlock',
        'lock', 'pool', 'resource'
    ]

    data_count = sum(1 for k in data_keywords if k in error_text)
    system_count = sum(1 for k in system_keywords if k in error_text)

    if data_count > 0 or system_count > 0:
        return 'data' if data_count > system_count else 'system'

    if 'exception' in error_type.lower():
        return 'system'

    return 'system'


def extract_customer_id(log_block: str) -> Optional[str]:
    for pattern in CUSTOMER_PATTERNS:
        match = pattern.search(log_block)
        if match and match.group(1):
            return match.group(1).strip()
    return None


def get_week_number(date_obj: datetime) -> int:
    return int(date_obj.isocalendar()[1])


def parse_log_entry(timestamp_str: str, block_text: str, country: str, environment: str) -> Optional[Dict[str, Any]]:
    try:
        date_obj = parse_timestamp(timestamp_str)
        if not date_obj:
            return None
        
        operation = 'Unknown'
        message = block_text[:500]
        severity = 'Info'
        error_type = 'N/A'
        category = 'unknown'
        customer_id = None

        severity_match = SEVERITY_PATTERN.search(block_text)
        if severity_match:
            sev = severity_match.group(1).lower()
            if 'error' in sev:
                severity = 'Error'
            elif 'fatal' in sev:
                severity = 'Fatal'
            elif 'warn' in sev:
                severity = 'Warning'
            elif 'debug' in sev:
                severity = 'Debug'

        erp_request_match = ERP_REQUEST_PATTERN.search(block_text)
        if erp_request_match:
            operation = erp_request_match.group(1).strip()
        else:
            operation_match = OPERATION_PATTERN.search(block_text)
            if operation_match:
                operation = operation_match.group(1).strip()

        message_match = MESSAGE_PATTERN.search(block_text)
        if message_match:
            message = message_match.group(1).strip()[:500]

        errors_match = ERRORS_PATTERN.search(block_text)
        if errors_match and errors_match.group(1).strip() and '<Errors></Errors>' not in errors_match.group(0):
            severity = 'Error'
            error_tag_match = ERROR_TAG_PATTERN.search(errors_match.group(1))
            if error_tag_match:
                message = f"ERP Error: {error_tag_match.group(1).strip()}"[:500]

        if severity == 'Error' or 'error' in message.lower():
            error_type = extract_error_type(message)
            category = classify_error_category(error_type, message)
            customer_id = extract_customer_id(block_text)
        
        return {
            'timestamp': timestamp_str,
            'date': date_obj.isoformat(),
            'severity': severity,
            'category': category,
            'country': country,
            'environment': environment,
            'operation': operation,
            'errorType': error_type,
            'message': message,
            'customerId': customer_id,
            'hour': date_obj.hour,
            'dayOfWeek': date_obj.strftime('%A'),
            'weekNumber': get_week_number(date_obj),
        }
    except:
        return None


def parse_log_file(file_path: str, country: str, environment: str) -> Generator[Dict[str, Any], None, None]:
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore', buffering=65536) as f:
            current_timestamp = None
            current_block = []
            
            for line in f:
                line = line.rstrip('\n')
                
                if line.startswith('Timestamp:'):
                    if current_timestamp and current_block:
                        block_text = '\n'.join(current_block)
                        entry = parse_log_entry(current_timestamp, block_text, country, environment)
                        if entry:
                            yield entry
                    
                    m = TIMESTAMP_PATTERN.search(line)
                    if m:
                        current_timestamp = m.group(1).strip()
                    current_block = [line]
                else:
                    if current_timestamp is not None:
                        current_block.append(line)
            
            if current_timestamp and current_block:
                block_text = '\n'.join(current_block)
                entry = parse_log_entry(current_timestamp, block_text, country, environment)
                if entry:
                    yield entry
    except:
        pass


def find_log_files(base_path: str) -> Generator[str, None, None]:
    try:
        base = Path(base_path)
        if not base.exists():
            raise FileNotFoundError(f"Path not found: {base_path}")
        
        for f in base.rglob('*.txt'):
            if f.is_file():
                yield str(f)
    except:
        pass


def ingest_logs_streaming(base_path: str) -> Dict[str, Any]:
    """Stream entries directly to stdout, no temp files"""
    print(f"{Colors.CYAN}[Ingest] Starting from: {base_path}{Colors.RESET}", file=sys.stderr)
    
    files_processed = 0
    entries_parsed = 0
    countries_set = set()
    environments_set = set()
    errors = []
    
    try:
        log_files = list(find_log_files(base_path))
        print(f"{Colors.CYAN}[Ingest] Found {len(log_files)} files{Colors.RESET}", file=sys.stderr)
        
        # Stream entries directly to stdout as JSONL
        for idx, file_path in enumerate(log_files, 1):
            try:
                country, env = extract_metadata_from_path(file_path, base_path)
                countries_set.add(country)
                environments_set.add(env)
                
                for entry in parse_log_file(file_path, country, env):
                    # Write entry immediately to stdout
                    print(json.dumps(entry, separators=(',', ':')))
                    sys.stdout.flush()  # Ensure immediate delivery
                    entries_parsed += 1
                
                files_processed += 1
                
                # Progress to stderr only
                if idx % 10 == 0 or idx == len(log_files):
                    print(f"{Colors.CYAN}[Ingest] {idx}/{len(log_files)}: {entries_parsed} entries{Colors.RESET}", file=sys.stderr)
            except Exception as e:
                errors.append(f"Error in {file_path}: {str(e)}")
        
        print(f"{Colors.GREEN}[Ingest] Done: {files_processed} files, {entries_parsed} entries{Colors.RESET}", file=sys.stderr)
        
        # Return stats (this will be the final line with STATS: prefix)
        return {
            'filesProcessed': files_processed,
            'parsedEntries': entries_parsed,
            'countries': sorted(list(countries_set)),
            'environments': sorted(list(environments_set)),
            'errors': errors,
            'timestamp': datetime.now().isoformat(),
        }
    
    except Exception as e:
        return {
            'filesProcessed': 0,
            'parsedEntries': 0,
            'countries': [],
            'environments': [],
            'errors': [f"Fatal: {str(e)}"],
            'timestamp': datetime.now().isoformat(),
        }


def main():
    if len(sys.argv) < 2:
        print("Usage: python ingest_logs.py <basePath>", file=sys.stderr)
        sys.exit(1)
    
    base_path = sys.argv[1]
    
    # Stream entries to stdout, then output final stats
    result = ingest_logs_streaming(base_path)
    
    # Output final stats with special prefix so Node.js can identify it
    stats_line = "STATS:" + json.dumps(result, separators=(',', ':'), default=str)
    print(stats_line)
    sys.stdout.flush()
    
    sys.exit(0)


if __name__ == '__main__':
    main()
