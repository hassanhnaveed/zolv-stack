import sys
from pdf2docx import Converter

def convert(pdf_path, docx_path):
    cv = Converter(pdf_path)
    cv.convert(docx_path, start=0, end=None)
    cv.close()

if __name__ == "__main__":
    convert(sys.argv[1], sys.argv[2])