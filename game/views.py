from django.http import HttpResponse
def index(request):
    line1='<h1 style="text-align:center">啵唧啵唧~</h1>'
    line2='<img src="https://p0.ifengimg.com/pmop/2018/0212/90CBCCD8AFF18463F4B9297C90ABAB20DEF5392D_size16_w426_h434.jpeg" width=2000 >'
    return HttpResponse(line1+line2)
