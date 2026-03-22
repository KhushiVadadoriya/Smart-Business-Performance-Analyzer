import requests
files = {'file': ('test.csv', b'date,revenue,cost\n2024-01-01,100,50\n2024-01-02,200,80\n', 'text/csv')}
res = requests.post('http://127.0.0.1:8000/api/v1/columns/discover', files=files)
print('STATUS:', res.status_code)
print('RESPONSE:', res.text)
