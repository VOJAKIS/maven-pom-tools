#!/bin/bash

if [ -z "${1}" ]; then
	echo "The script needs a filename as an argument."
	echo "example: . compressor.sh image.gif"
	echo "outputs: image-lossy30.gif, image-lossy50.gif, ..."
	return 0
fi

# lossies=(30 50 70 100)
lossy=50
colorss=(64)

for colors in ${colorss[@]}; do
	input_filename="${1}"
	output_filename="${input_filename%.gif}-colors${colors}.gif"
	echo ${output_filename}
	gifsicle -O3 --colors "${colors}" --lossy=$lossy --threads=14 -o "${output_filename}" "${input_filename}"
done
