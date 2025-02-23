from django.shortcuts import redirect
import requests
from django.core.cache import cache
from django.contrib.auth.models import User
from django.contrib.auth import login
from game.models.player.player import Player
def receive_code(request):
    data = request.GET
    code = data.get("code")
    state = data.get("state")
    if not cache.has_key(state):
        return redirect ("index")

    cache.delete(state)

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/" # 申请授权令牌的api
    params = { # 三个参数
        'appid': "6069",
        'secret': "3261a1aea1624576a54194dc3c7c9b0e",
        'code': code,
    }
    
    access_token_res = requests.get(apply_access_token_url, params = params).json() # 通过传入这几个参数访问api，获取授权令牌
    
    print(access_token_res) # 测试
    
    access_token = access_token_res['access_token'] # 授权令牌
    openid = access_token_res['openid'] # openid
    
    players = Player.objects.filter(openid = openid) # 在自己的服务器上的数据库找到一样的openid的玩家，表示已经有这个用户了，直接登录
    if players.exists():
        login(request, players[0].user)
        return redirect("index")
    
    # 否则就获取信息放到自己的服务器的数据库上再登录
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }
    userinfo_res = requests.get(get_userinfo_url, params = params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']
    
    # 如果出现重名就在后面加数字，直到没出现过这个id为止
    while User.objects.filter(username = username).exists():
        username += str(randint(0, 9))
    
    user = User.objects.create(username = username)
    player = Player.objects.create(user = user, photo = photo, openid = openid)
    
    login(request, user);
    
    return redirect("index")
