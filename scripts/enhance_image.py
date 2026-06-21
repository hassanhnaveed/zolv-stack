import sys
from PIL import Image
from realesrgan_ncnn_py import Realesrgan

input_path = sys.argv[1]
output_path = sys.argv[2]

realesrgan = Realesrgan(gpuid=0)

image = Image.open(input_path)
result = realesrgan.process_pil(image)
result.save(output_path)

print("done")