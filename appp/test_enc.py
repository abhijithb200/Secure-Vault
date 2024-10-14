from cryptography.fernet import Fernet


# Load the key from the file
with open('secret.key', 'rb') as key_file:
    encryption_key = key_file.read()

    
cipher_suite = Fernet(encryption_key)

def encrypt(data):
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt(data):
    return cipher_suite.decrypt(data.encode()).decode()


print(encrypt("test"))

print(decrypt("gAAAAABmsbgQ3ou79oA9bJ29VWTxZyf96STJrLDa22IA7lk7YIvKYpamdxBE_x0lmqGtZwkLP50zsLG7UPKxD721BLTfPimAvg=="))