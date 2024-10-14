```
docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=your_mysql_root_password -e MYSQL_DATABASE=token_db -e MYSQL_USER=your_mysql_user -e MYSQL_PASSWORD=your_mysql_password -p 3306:3306 -d mysql:latest
```

```
docker exec -it mysql-container bash
```

```
mysql -u your_mysql_user -p
```


- Get the columns that the admin has access to
```
SELECT COLUMN_NAME
FROM (
    SELECT 
        'ssn' AS COLUMN_NAME, ssn AS ACCESS FROM access_control WHERE role = 'admin'
    UNION ALL
    SELECT 
        'dob' AS COLUMN_NAME, dob AS ACCESS FROM access_control WHERE role = 'admin'
    UNION ALL
    SELECT 
        'place' AS COLUMN_NAME, place AS ACCESS FROM access_control WHERE role = 'admin'
) AS access_table
WHERE ACCESS = 1;
```