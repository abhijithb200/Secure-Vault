from collection import *

data = {
    "table_name" : "customer",
    "data" :{
    "ssn": "123-45-6789",
    "dob": "1980-01-01",
    "credit_card": "4111-1111-1111-1111",
    "place": "New York"
    }
    }

final = []
for key, value in data['data'].items():
        if key == 'ssn':
            f = SSN(value)


        elif key == 'dob':
            f = DOB(value)


            
        elif key == 'credit_card':
            f = CreditCard(value)

            
        else:
            f = Default(value,key)

        final.append(f)

column_definitions = ", ".join([f"{col.name}, {col.name}_masked" for col in final])

for i in final:
     print(i.value)
     print(i.name)

import uuid
token = str(uuid.uuid4())

query = f'''
 INSERT INTO ({column_definitions}) VALUES ({', '.join(['%s'] * len(final)*2)});
'''
query = f'''
 INSERT INTO ({column_definitions}) VALUES ({', '.join((col.value)  for col in final)});
'''

print( [ f"'{i.value}', '{i.masked()}'" for i in final])

query_param = []

for i in final:
     query_param.append(i.value)
     query_param.append(i.masked())
query_param = [param for i in final for param in (i.value, i.masked())]

print(query)