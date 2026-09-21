"""Editable, dependency-free one-page sample CV generator. Run with Python 3."""
from pathlib import Path
import textwrap

def escape(value):
    return value.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')

commands = ['0.14 0.15 0.14 rg']
y = 778

def text(value, size=11, font='F1', leading=17):
    global y
    commands.append(f'BT /{font} {size} Tf 1 0 0 1 52 {y} Tm ({escape(value)}) Tj ET')
    y -= leading

def paragraph(value):
    global y
    for line in textwrap.wrap(value, width=79):
        text(line)
    y -= 16

def heading(value):
    global y
    text(value, 12, 'F2', 24)

text('SAMPLE CV / DEMONSTRATION CONTENT', 9, 'F2', 40)
text('ANDREY MAZUROV', 30, 'F3', 35)
text('FullStack JavaScript Developer', 13, 'F1', 25)
text('test@test.com', 11, 'F1', 36)
heading('PROFILE')
paragraph('Fullstack developer focused on turning product ideas into responsive interfaces and maintainable server-side applications. A practical approach to clear architecture, readable code and thoughtful user experiences.')
heading('CORE TECHNOLOGIES')
paragraph('TypeScript / React / NestJS')
heading('ADDITIONAL TOOLS - EXAMPLE STACK')
paragraph('Node.js, JavaScript, HTML, CSS, PostgreSQL, REST APIs, Git and Docker. Adapt this list to reflect your actual experience.')
heading('PROJECT AREAS - ILLUSTRATIVE')
paragraph('Web interfaces: accessible components, responsive layouts and clear interaction states. APIs: structured application logic and predictable data exchange. Product delivery: connecting the browser, server and database.')
heading('EXPERIENCE & EDUCATION')
paragraph('Add verified roles, project descriptions, dates and qualifications here. No employment history or education credentials are represented by this sample.')
text('This is a one-page example, not a verified professional resume.', 9, 'F1')
stream = '\n'.join(commands).encode('ascii')
objects = [
 b'<< /Type /Catalog /Pages 2 0 R >>',
 b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
 b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>',
 b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
 b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
 b'<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>',
 b'<< /Length ' + str(len(stream)).encode() + b' >>\nstream\n' + stream + b'\nendstream'
]
output = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
offsets = [0]
for number, obj in enumerate(objects, 1):
    offsets.append(len(output))
    output.extend(f'{number} 0 obj\n'.encode() + obj + b'\nendobj\n')
xref = len(output)
output.extend(f'xref\n0 {len(objects)+1}\n0000000000 65535 f \n'.encode())
for offset in offsets[1:]:
    output.extend(f'{offset:010d} 00000 n \n'.encode())
output.extend(f'trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode())
Path(__file__).with_name('cv-example.pdf').write_bytes(output)
