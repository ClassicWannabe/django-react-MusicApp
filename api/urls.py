from django.urls import path
from .views import RoomView, CreateRoomView, GetRoomView

urlpatterns = [
    path('',RoomView.as_view()),
    path('create-room', CreateRoomView.as_view()),
    path('room/<str:code>', GetRoomView.as_view()),
]
