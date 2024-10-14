import re
from datetime import datetime


class Default:
    def __init__(self, value, category):
        self.value = value
        self.name = category
        self.type = "VARCHAR(500)"
    
    def validate(self):
        return True
    
    def masked(self):
        return "** MASKED **"
    
class SSN:
    def __init__(self, ssn):
        self.value = ssn
        self.name = "ssn"
        self.type = "VARCHAR(100)"
    
    def validate(self):
        # Validate SSN format (e.g., XXX-XX-XXXX)
        pattern = r"^\d{3}-\d{2}-\d{4}$"
        return bool(re.match(pattern, self.value))
    
    def masked(self):
        # Return masked SSN (e.g., XXX-XX-1234)
        return f"XXX-XX-{self.value[-4:]}"

class DOB:
    def __init__(self, dob):
        self.value = dob
        self.name = "dob"
        self.type = "VARCHAR(100)"
    
    def validate(self):
        # Validate DOB format (e.g., YYYY-MM-DD)
        try:
            datetime.strptime(self.value, "%Y-%m-%d")
            return True
        except ValueError:
            return False
    
    def masked(self):
        # Return masked DOB (e.g., XXXX-XX-15)
        return f"XXXX-XX-{self.value[-2:]}"
    
class CreditCard:
    def __init__(self, card_number):
        self.value = card_number
        self.name = "credit_card"
        self.type = "VARCHAR(200)"
    
    def validate(self):
        # Validate credit card number using Luhn algorithm
        def luhn_check(number):
            def digits_of(n):
                return [int(d) for d in str(n)]
            digits = digits_of(number)
            odd_digits = digits[-1::-2]
            even_digits = digits[-2::-2]
            checksum = sum(odd_digits)
            for d in even_digits:
                checksum += sum(digits_of(d * 2))
            return checksum % 10 == 0

        # Remove non-digit characters
        card_number_digits = re.sub(r'\D', '', self.value)
        return luhn_check(card_number_digits)
    
    def masked(self):
        # Mask all but the last 4 digits of the credit card number
        return f"**** **** **** {self.value[-4:]}"
