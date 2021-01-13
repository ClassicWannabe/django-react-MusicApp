from django.shortcuts import render
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import RoomSerializer, CreateRoomSerializer
from .models import Room


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoomView(generics.RetrieveAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    lookup_field = 'code'

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not request.session.exists(request.session.session_key):
            request.session.create()

        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data['guest_can_pause']
            votes_to_skip = serializer.data['votes_to_skip']
            host = request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.created_at = timezone.now()
                room.save(update_fields=[
                          'guest_can_pause', 'votes_to_skip', 'created_at'])
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room.objects.create(host=host,
                                           guest_can_pause=guest_can_pause,
                                           votes_to_skip=votes_to_skip)
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        
        return Response({"Bad request":"Invalid data..."}, status=status.HTTP_400_BAD_REQUEST)
