from django.shortcuts import render, redirect
from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post
from .utils import update_or_create_user_tokens, is_spotify_authenticated, execute_spotify_api_call, play_song, pause_song
from api.models import Room


class AuthURL(APIView):
    def get(self, request, *args, **kwargs):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, *args, **kwargs):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'client_id': CLIENT_ID,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error_token = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')

class IsAuthenticated(APIView):
    def get(self, request, *args, **kwargs):
        is_authenticated = is_spotify_authenticated(request.session.session_key)
        return Response({'status':is_authenticated},status=status.HTTP_200_OK)

class CurrentSong(APIView):
    def get(self,request, *args, **kwargs):
        print(request.session)
        room_code = request.session.get('room_code')
        room_qs = Room.objects.filter(code=room_code)
        if room_qs.exists():
            room = room_qs[0]
        else:
            return Response({},status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = 'player/currently-playing'
        response = execute_spotify_api_call(host, endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ''
        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ', '
            name = artist.get('name')
            artist_string += name
        
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': 0,
            'id': song_id
        }

        return Response(song, status=status.HTTP_200_OK)

class PauseSong(APIView):
    def put(self, request, *args, **kwargs):
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if request.session.session_key == room.host or room.guest_can_pause:
            res = pause_song(room.host)
            print(res)
            return Response({'message':res},status=status.HTTP_204_NO_CONTENT)
        
        return Response({},status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    def put(self, request, *args, **kwargs):
        room_code = request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({},status=status.HTTP_204_NO_CONTENT)
        
        return Response({},status=status.HTTP_403_FORBIDDEN)

