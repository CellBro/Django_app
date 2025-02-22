from django.contrib.auth import authenticate,login
from django.http import JsonResponse

def login(request):
    data = request.GET
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username,password=password)
