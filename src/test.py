# test_file.py
# This is a sample Python file for testing the pull request reviewer.

# 1. Imports (Unnecessary imports)
import math
import os  # This import is not used

# 2. Function with issues (e.g., bad naming, unused variables)
def calc_area(radius):
    # Poor variable naming and redundant code
    pi_value = 3.14  # Should use math.pi
    area = pi_value * radius ** 2
    redundant_variable = 0  # This variable is not used
    return area

# 3. Missing error handling
def divide(a, b):
    # No check for division by zero
    return a / b

# 4. Inconsistent coding style
def SayHello(name): print(f"Hello, {name}")  # Improper function naming and single-line definition

# 5. Inefficient code
def find_max(numbers):
    # Inefficient O(n^2) operation
    max_num = -float('inf')
    for i in numbers:
        for j in numbers:
            if i > max_num:
                max_num = i
    return max_num

# 6. Missing docstrings
def greet(name):
    print(f"Greetings, {name}")

# 7. Deprecated practice (manual file handling)
def read_file(file_path):
    # Context manager should be used instead
    file = open(file_path, 'r')
    content = file.read()
    file.close()
    return content

# 8. Hardcoded constants
def calculate_discount(price):
    discount_rate = 0.1  # Magic number
    return price - (price * discount_rate)

# 9. Unused function
def unused_function():
    pass

# Main logic for testing
if __name__ == "__main__":
    print(calc_area(5))  # Should calculate the area of a circle with radius 5
    print(divide(10, 2))  # Should return 5.0
    print(divide(10, 0))  # Should raise an exception
    print(find_max([1, 2, 3, 4, 5]))  # Should return 5
    print(read_file("example.txt"))  # Should return the content of example.txt
