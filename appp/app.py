from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import uuid
import mysql.connector
from cryptography.fernet import Fernet
from collection import *
import hashlib

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this to a random secret key

jwt = JWTManager(app)

# In-memory storage for users and tokens (for demonstration purposes)
db_config = {
    'user': 'your_mysql_user',
    'password': 'your_mysql_password',
    'host': '127.0.0.1',
    'port': '3306',  # Optional since 3306 is the default port for MySQL
    'database': 'token_db'
}

with open('secret.key', 'rb') as key_file:
    encryption_key = key_file.read()


cipher_suite = Fernet(encryption_key)

def encrypt(data):
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt(data):
    return cipher_suite.decrypt(data.encode()).decode()

def get_db_connection():
    return mysql.connector.connect(**db_config)


tokens_store = {}
reverse_tokens_store = {}


@app.route('/create_table_with_access', methods=['POST'])
# used to 
    # 1. Create customer table to store the sensitive data from the user
    # 2. Create access_control table to store who have access to what data
    # 3. Insert data into access_crontrol talble 
def create_table_with_access():
    data = request.json
    table_name = data.get('tablename')
    columns = data.get('columns')
    final = []
    query = ''

    if not table_name or not columns:
        return jsonify({'error': 'Table name and columns are required'}), 400
    
    for i in data['columns']:
        d = {}
        if i['name']=='ssn':
            s = SSN('')
            final.append(s)

        elif i['name']=='dob':
            d = DOB('')
            final.append(d)
        
        elif i['name']=='credit_card':
            c = CreditCard('')
            final.append(c)
        
        else:
            de = Default('',i['name'])
            final.append(de)


    column_definitions = ", ".join([f"{col.name} {col.type}, {col.name}_masked {col.type}" for col in final])
    ac_column_definitions = ", ".join([f"{col.name} INT" for col in final])


    query += f"CREATE TABLE {table_name} (token VARCHAR(100) PRIMARY KEY, {column_definitions});\n"
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

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        for que in query.split(';'):
            if que.strip():
                cursor.execute(que)
        
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': "Tables created and access control are in place"}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    
@app.route('/delete_tables', methods=['POST'])
def delete_tables():
    delete_customer_table_query = "DROP TABLE IF EXISTS customer;"
    delete_access_control_table_query = "DROP TABLE IF EXISTS access_control;"
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute(delete_customer_table_query)
        cursor.execute(delete_access_control_table_query)
        
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': "Tables deleted successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500



@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user is None:
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)



@app.route('/tokenize', methods=['POST'])
# 1. data coming from the user is stored inside the customer db
# @jwt_required()
def tokenize():
    # current_user = get_jwt_identity()
    data = request.json
    if not data or not isinstance(data, dict):
        return jsonify({'error': 'Invalid data provided'}), 400
    
    table_name = data.get('tablename')
    
    final = []
    for key, value in data['data'].items():
        if key == 'ssn':
            f = SSN(value)
            if not f.validate():
                return jsonify({'error': 'Invalid SSN format'}), 400

        elif key == 'dob':
            f = DOB(value)
            if not f.validate():
                return jsonify({'error': 'Invalid DOB format'}), 400

            
        elif key == 'credit_card':
            f = CreditCard(value)
            if not f.validate():
                return jsonify({'error' : 'Invalid Credit Card format'}), 400
            
        else:
            f = Default(value,key)

        final.append(f)

    column_definitions = ", ".join([f"{col.name}, {col.name}_masked" for col in final])
    token = str(uuid.uuid4())

    query = f'''
    INSERT INTO {table_name} (token, {column_definitions}) VALUES ({', '.join(['%s'] * (len(final)*2+1))});
    '''

    name_list = [token] + [param for i in final for param in (encrypt(i.value), encrypt(i.masked()))]

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(query, name_list)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Customer added successfully', 'token':token}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    

def get_accessible_columns(role):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Fetch the column names from the access_control table
        cursor.execute("SHOW COLUMNS FROM access_control;")
        columns = cursor.fetchall()

        # Build the dynamic query
        subqueries_accessible = []
        subqueries_non_accessible = []
        for column in columns:
            column_name = column[0]
            if column_name != 'role':
                subquery_accessible = f"SELECT '{column_name}' AS COLUMN_NAME, {column_name} AS ACCESS FROM access_control WHERE role = %s AND {column_name} = 1"
                subqueries_accessible.append(subquery_accessible)
                subquery_non_accessible = f"SELECT '{column_name}' AS COLUMN_NAME, {column_name} AS ACCESS FROM access_control WHERE role = %s AND {column_name} = 0"
                subqueries_non_accessible.append(subquery_non_accessible)

        union_query_accessible = " UNION ALL ".join(subqueries_accessible)
        final_query_accessible = f"""
        SELECT COLUMN_NAME
        FROM ({union_query_accessible}) AS access_table;
        """

        union_query_non_accessible = " UNION ALL ".join(subqueries_non_accessible)
        final_query_non_accessible = f"""
        SELECT COLUMN_NAME
        FROM ({union_query_non_accessible}) AS access_table;
        """

        cursor.execute(final_query_accessible, (role,) * len(subqueries_accessible))
        result_accessible = cursor.fetchall()

        cursor.execute(final_query_non_accessible, (role,) * len(subqueries_non_accessible))
        result_non_accessible = cursor.fetchall()

        cursor.close()
        connection.close()

        accessible_columns = [row[0] for row in result_accessible]
        non_accessible_columns = [row[0] for row in result_non_accessible]

        return [accessible_columns, non_accessible_columns]
    except:
        pass


@app.route('/detokenize', methods=['POST'])
# @jwt_required()
def detokenize():
    # current_user = get_jwt_identity()
    data = request.json
    
    token = data.get('token')
    role = data.get('role')

    if not role:
        return jsonify({'error': 'Role is required'}), 400

    # get the column names from the customer database according to the role
    
    columns = get_accessible_columns(role)

    if  columns == [[], []]:
        return jsonify({'error': 'Role not found'}), 400
    
    access_columns = columns[0] + [ f"{i}_masked" for i in columns[1]]

    if not token:
        return jsonify({'error': 'Token is required'}), 400

    query = f"""
    SELECT {','.join(access_columns)}
    FROM customer
    WHERE token = %s;
    """

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, (token,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if result:
            for key in access_columns:
                result[key] = decrypt(result[key])

            updated_res = {key.replace('_masked', ''): value for key, value in result.items()}
            return jsonify(updated_res), 200
        else:
            return jsonify({'error': 'No customer found for the given token'}), 404

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    
@app.route('/generate-token', methods=['POST'])
def generate_token():
    try:
        # Extract email from the request
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({"error": "Email is required"}), 400

        # Split email into local part and domain
        local_part, domain = email.split('@')

        # Generate hash of the local part
        hash_object = hashlib.sha256(local_part.encode())
        hashed_local_part = hash_object.hexdigest()

        # Create token by combining the hashed local part with the original domain
        token = f"{hashed_local_part}@{domain}"

        return jsonify({"token": token}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/edit', methods=['PUT'])
# @jwt_required()
def edit():
    # current_user = get_jwt_identity()
    data = request.json
    
    token = data.get('token')
    new_data = data.get('data')

    if not token:
        return jsonify({'error': 'Token is required'}), 400

    if not new_data or not isinstance(new_data, dict):
        return jsonify({'error': 'Invalid data provided'}), 400

    # Build the SQL query dynamically based on provided fields
    update_clauses = []
    name_list = []

    for key, value in new_data.items():
        if key == 'ssn':
            f = SSN(value)
            if not f.validate():
                return jsonify({'error': 'Invalid SSN format'}), 400

        elif key == 'dob':
            f = DOB(value)
            if not f.validate():
                return jsonify({'error': 'Invalid DOB format'}), 400
            
        elif key == 'credit_card':
            f = CreditCard(value)
            if not f.validate():
                return jsonify({'error': 'Invalid Credit Card format'}), 400
            
        else:
            f = Default(value, key)

        # Prepare the columns for the SQL query
        update_clauses.append(f"{f.name} = %s")
        update_clauses.append(f"{f.name}_masked = %s")
        name_list.extend([encrypt(f.value), encrypt(f.masked())])

    name_list.append(token)

    if not update_clauses:
        return jsonify({'error': 'No valid fields to update'}), 400

    query = f"""
    UPDATE customer
    SET {', '.join(update_clauses)}
    WHERE token = %s;
    """

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(query, tuple(name_list))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'message': 'Customer updated successfully'}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500



if __name__ == '__main__':
    app.run(debug=True)
