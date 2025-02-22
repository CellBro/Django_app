from django.http import JsonResponse
from game.models.player.player import Player

def getinfo_acapp(request): # 在AcWingOS时的getinfo
    player = Player.objects.all()[0]
    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
        })

def getinfo_web(request): # 在网页端时的getinfo
    user=request.user
    if not user.is_authenticated:
         return JsonResponse({
            'result':"未登录",
            })
    else:
        player = Player.objects.all()[0]
        return JsonResponse({ # 返回Json
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
            })

def getinfo(request): # 每个处理请求的函数都要有这个参数'request'
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    else:
        return getinfo_web(request)
