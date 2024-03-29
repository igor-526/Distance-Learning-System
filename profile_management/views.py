from django.contrib.auth.decorators import permission_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.password_validation import validate_password
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from dls.utils import get_menu
from json import dumps
from django.http import Http404

from .forms import SignUpForm
from .models import (NewUser,
                     EngagementChannel,
                     Level,
                     Programs,
                     )
from .serializers import (NewUserSerializer,
                          EngagementChannelSerializer,
                          ProgramSerializer,
                          LevelSerializer,
                          )


def user_login(request):    # страница авторизации и логин
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse_lazy('dashboard'))
    return render(request, 'login.html')


def user_logout(request):    # логаут
    logout(request)
    return HttpResponseRedirect(reverse_lazy('login'))


@permission_required(perm='auth.register_listener', raise_exception=True)
def register_view(request):     # API для регистрации пользователей
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.update_tg_code()
            user.set_group(request.POST.get('role'))
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse(form.errors, status=400)


class DeactivateUserView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            user.is_active = False
            user.save()
            return JsonResponse({'status': 'success'}, status=200)
        except Exception as ex:
            return JsonResponse({'status': 'error', 'errors': ex}, status=400)


class ActivateUserView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        try:
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            user.is_active = True
            user.save()
            return JsonResponse({'status': 'success'}, status=200)
        except Exception as ex:
            return JsonResponse({'status': 'error', 'errors': ex}, status=400)


class ChangePasswordView(LoginRequiredMixin, APIView):
    def patch(self, request, *args, **kwargs):
        new_password = request.data.get('password')
        try:
            validate_password(new_password)
            user = NewUser.objects.get(pk=kwargs.get('pk'))
            user.set_password(new_password)
            user.save()
            return JsonResponse({'status': 'success'}, status=200)
        except ValidationError as ex:
            return JsonResponse({'status': 'error', 'password': ex.messages}, status=400)


class DashboardPage(LoginRequiredMixin, TemplateView):    # главная страница Dashboard
    template_name = "dashboard.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Дэшборд', 'menu': get_menu(request.user)}
        return render(request, self.template_name, context)


class ProfilePage(LoginRequiredMixin, TemplateView):
    template_name = "profile/profile.html"

    def get(self, request, *args, **kwargs):
        user_object = {
            'first_name': None,
            'last_name': None,
            'photo': None,
            'role': None,
            'last_activity': None,
            'date_joined': None,
            'bdate': None,
            'private_lessons': None,
            'group_lessons': None,
            'note': None,
            'progress': None,
            'level': None,
            'age': None,
            'id': None,
            'email': None,
            'tg': False
        }
        if self.kwargs.get('pk'):
            puser = NewUser.objects.filter(id=self.kwargs.get('pk')).first()
        else:
            puser = request.user
        if puser:
            user_object['first_name'] = puser.first_name
            user_object['last_name'] = puser.last_name
            user_object['photo'] = puser.photo.url
            user_object['last_activity'] = puser.last_activity
            user_object['date_joined'] = puser.date_joined
            user_object['id'] = puser.id
            user_object['bdate'] = puser.bdate
            user_object['email'] = puser.email
            role = puser.groups.first().name
            perms = request.user.get_all_permissions()
            if role == 'Admin':
                user_object['role'] = 'Администратор'
                if 'auth.see_moreinfo_admin' in perms:
                    user_object['note'] = puser.note
            if role == 'Metodist':
                user_object['role'] = 'Методист'
                if 'auth.see_moreinfo_metodist' in perms:
                    user_object['note'] = puser.note
            if role == 'Teacher':
                user_object['role'] = 'Преподаватель'
                user_object['private_lessons'] = True if puser.private_lessons else False
                user_object['group_lessons'] = True if puser.group_lessons else False
                user_object['level'] = puser.level
                if 'auth.see_moreinfo_teacher' in perms:
                    user_object['note'] = puser.note
            if role == 'Listener':
                user_object['role'] = 'Ученик'
                user_object['private_lessons'] = True if puser.private_lessons else False
                user_object['group_lessons'] = True if puser.group_lessons else False
                user_object['level'] = puser.level
                if 'auth.see_moreinfo_listener' in perms:
                    user_object['note'] = puser.note
                    user_object['progress'] = puser.progress
        else:
            raise Http404

        context = {'title': f"Профиль: {puser}",
                   'menu': get_menu(request.user),
                   'puser': user_object,
                   'self': puser == request.user}
        return render(request, self.template_name, context)


class UsersPage(LoginRequiredMixin, TemplateView):  # страница пользователей (администрирование)
    template_name = "users/users.html"

    def get(self, request, *args, **kwargs):
        context = {'title': 'Пользователи',
                   'menu': get_menu(request.user),
                   'perms': dumps({'permissions': list(request.user.get_all_permissions())})}
        return render(request, self.template_name, context)


class UserListAPIView(LoginRequiredMixin, ListAPIView):     # API для вывода списка пользователей
    serializer_class = NewUserSerializer

    def get_queryset(self):
        group = self.request.query_params.get('group')
        if not group:
            return NewUser.objects.all()
        elif group == 'listeners':
            return NewUser.objects.filter(groups__name='Listener')
        elif group == 'teachers':
            return NewUser.objects.filter(
                Q(groups__name='Teacher') | Q(groups__name='Metodist') | Q(groups__name='Admin'))

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = NewUserSerializer(queryset, many=True)
        return Response(serializer.data)


class UserAPIView(LoginRequiredMixin, RetrieveUpdateAPIView):    # API для вывода, изменения и удаления пользователя
    queryset = NewUser.objects.all()
    serializer_class = NewUserSerializer

    def patch(self, request, *args, **kwargs):
        data = request.data
        user = self.get_object()
        if data.get('role'):
            user.set_group(data.get('role'))
        if data.get('eng_channel_new') or data.get('eng_channel'):
            en_ch = data.get('eng_channel_new') if data.get(
                'eng_channel_new') else data.get('eng_channel')
            user.set_engagement_channel(en_ch)
        if data.get('lvl_new') or data.get('lvl_new'):
            lvl = data.get('lvl_new') if data.get('lvl_new') else data.get('lvl')
            user.set_level(lvl)
        if data.get('prog') or data.get('prog_new'):
            user.set_programs(data.getlist('prog'), data.get('prog_new'))
        if data.get('private_lessons') or data.get('group_lessons'):
            user.set_lessons_type(
                data.get('private_lessons'),
                data.get('group_lessons')
            )
        return super(UserAPIView, self).patch(request, *args, **kwargs)


class UserPhotoApiView(LoginRequiredMixin, APIView):    # API для получения, изменения и обновления фото
    def get(self, request, *args, **kwargs):
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        return JsonResponse({'photo': user.photo.url})

    def patch(self, request, *args, **kwargs):
        data = request.data
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        user.photo = data.get('photo')
        user.save()
        return JsonResponse({"status": "success"})

    def delete(self, request, *args, **kwargs):
        user = NewUser.objects.get(pk=kwargs.get('pk'))
        user.delete_photo()
        return JsonResponse({"status": "success"})


class EngagementListAPIView(LoginRequiredMixin, ListAPIView):   # API для вывода каналов привлечения
    queryset = EngagementChannel.objects.all()
    serializer_class = EngagementChannelSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = EngagementChannelSerializer(queryset, many=True)
        return Response(serializer.data)


class LevelListAPIView(LoginRequiredMixin, ListAPIView):    # API для вывода уровней
    queryset = Level.objects.all()
    serializer_class = LevelSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = LevelSerializer(queryset, many=True)
        return Response(serializer.data)


class ProgramListAPIView(LoginRequiredMixin, ListAPIView):  # API для вывода программ обучения
    queryset = Programs.objects.all()
    serializer_class = ProgramSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = ProgramSerializer(queryset, many=True)
        return Response(serializer.data)


class TelegramAPIView(LoginRequiredMixin, APIView):  # API для регистрации пользователей
    def delete(self, request, *args, **kwargs):
        try:
            telegram = NewUser.objects.get(id=kwargs.get('pk')).telegram.first()
            telegram.delete()
            return JsonResponse({"status": "success"}, status=200)
        except Exception as ex:
            return JsonResponse({"status": "error", "errors": ex}, status=400)

    def get(self, request, *args, **kwargs):
        user = NewUser.objects.get(id=kwargs.get('pk'))
        if user.telegram.first():
            return JsonResponse({"status": "connected"}, status=204)
        else:
            return JsonResponse({"status": "disconnected",
                                 "code": user.tg_code},
                                status=200)

