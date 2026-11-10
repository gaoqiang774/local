# -*- coding: utf-8 -*-
import sys

def to_html_entities(text):
    res = []
    for c in text:
        if ord(c) > 127:
            res.append(f"&#x{ord(c):04X};")
        else:
            res.append(c)
    return "".join(res)

def to_js_unicode(text):
    res = []
    for c in text:
        if ord(c) > 127:
            res.append(f"\\u{ord(c):04X}")
        elif c in ('"', '\\', '\n', '\r', '\t'):
            if c == '"': res.append('\\"')
            elif c == '\\': res.append('\\\\')
            elif c == '\n': res.append('\\n')
            elif c == '\r': res.append('\\r')
            elif c == '\t': res.append('\\t')
        else:
            res.append(c)
    return "".join(res)

print("Helper ready")
