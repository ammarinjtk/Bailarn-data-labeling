import fileinput
import deepcut
import sys

for line in fileinput.input():
    print(",".join(deepcut.tokenize(line)))
