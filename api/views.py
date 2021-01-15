from django.shortcuts import render
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoomView(APIView):
    serializer_class = RoomSerializer
    lookup_field = 'code'

    def get(self, request, *args, **kwargs):
        code = request.GET.get(self.lookup_field)
        if code != None:
            room_qs = Room.objects.filter(code=code)
            if len(room_qs) > 0:
                data = self.serializer_class(room_qs[0]).data
                data['is_host'] = request.session.session_key == room_qs[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({"Room not found": "Invalid code..."}, status=status.HTTP_204_NO_CONTENT)
        return Response({"Bad request": "Code parameter not found..."}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoomView(APIView):
    lookup_field = 'code'

    def post(self, request, *args, **kwargs):
        if not request.session.exists(request.session.session_key):
            request.session.create()
        code = request.data.get(self.lookup_field)
        if code != None:
            room_qs = Room.objects.filter(code=code)
            if len(room_qs) > 0:
                request.session['room_code'] = code
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            return Response({"Room not found": "Invalid code..."}, status=status.HTTP_204_NO_CONTENT)
        return Response({"Bad request": "Code parameter not found..."}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, *args, **kwargs):
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
                request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room.objects.create(host=host,
                                           guest_can_pause=guest_can_pause,
                                           votes_to_skip=votes_to_skip)
                request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({"Bad request": "Invalid data..."}, status=status.HTTP_400_BAD_REQUEST)


class UserInRoomView(APIView):
    def get(self, request, *args, **kwargs):
        if not request.session.exists(request.session.session_key):
            request.session.create()
        data = {
            'code': request.session.get('room_code')
        }
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoomView(APIView):
    def get(self, request, *args, **kwargs):
        if 'room_code' in request.session:
            request.session.pop('room_code')
            host_id = request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room_results[0].delete()
        return Response({'message': 'Success'}, status=status.HTTP_200_OK)


class UpdateRoomView(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, *args, **kwargs):
        if not request.session.exists(request.session.session_key):
            request.session.create()
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            code = serializer.data.get('code')
            votes_to_skip = serializer.data.get('votes_to_skip')
            guest_can_pause = serializer.data.get('guest_can_pause')
            room_qs = Room.objects.filter(code=code)
            if not room_qs.exists():
                return Response({'message': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
            user_id = request.session.session_key
            room = room_qs[0]
            if user_id != room.host:
                return Response({'message': 'No rights to change'}, status=status.HTTP_403_FORBIDDEN)
            room.votes_to_skip = votes_to_skip
            room.guest_can_pause = guest_can_pause
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST)
