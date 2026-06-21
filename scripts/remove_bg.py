import sys
from withoutbg import WithoutBG

input_path = sys.argv[1]
output_path = sys.argv[2]

model = WithoutBG.opensource()
result = model.remove_background(input_path)
result.save(output_path)
print("done")