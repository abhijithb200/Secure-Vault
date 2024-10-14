data = {
"tablename":"customer",
"columns": [
    {
        "name": "ssn",
        "access": [
            {"rolename": "admin", "type": "plaintext"},
            {"rolename": "customerservice-alabama", "type": "masked"},
            {"rolename": "customerservice-australia", "type": "masked"}
        ]
    },
    {
        "name": "dob",
        "access": [
            {"rolename": "admin", "type": "plaintext"},
            {"rolename": "customerservice-alabama", "type": "masked"},
            {"rolename": "customerservice-australia", "type": "masked"}
        ]
    },
    {
        "name": "credit_card",
        "access": [
            {"rolename": "admin", "type": "plaintext"},
            {"rolename": "customerservice-alabama", "type": "masked"},
            {"rolename": "customerservice-australia", "type": "masked"} 
        ]
    },
    {
        "name": "place",
        "access": [
            {"rolename": "admin", "type": "plaintext"},
            {"rolename": "customerservice-alabama", "type": "plaintext"},
            {"rolename": "customerservice-australia", "type": "plaintext"}
        ]
    }
]
}



from collection import *

table_name = data["tablename"]
final = []
query = ''




for i in data['columns']:
    d = {}
    if i['name']=='ssn':
        s = SSN('')
        final.append(s)

    elif i['name']=='dob':
        d = DOB('')
        final.append(d)
    
    else:
        de = Default('',i['name'])
        final.append(de)


column_definitions = ", ".join([f"{col.name} {col.type}, {col.name}_masked {col.type}" for col in final])
ac_column_definitions = ", ".join([f"{col.name} INT" for col in final])


query += f"CREATE TABLE {table_name} ({column_definitions});\n"
query += f"CREATE TABLE access_control (role VARCHAR(255), {ac_column_definitions});\n"


roles = {}

# Process each item in the JSON array
for item in data['columns']:
    column_name = item['name']
    for access in item['access']:
        rolename = access['rolename'].replace('-', '_')
        if rolename not in roles:
            roles[rolename] = {}
        roles[rolename][column_name] = 1 if access['type'] == 'plaintext' else 0
    


# Generate SQL INSERT statements
for rolename, columns in roles.items():
    columns_str = ', '.join(str(columns.get(col.name, 0)) for col in final)
    sql = f"INSERT INTO access_control (role, {', '.join((col.name) for col in final)} ) VALUES ('{rolename}', {columns_str});\n"
    query += sql

