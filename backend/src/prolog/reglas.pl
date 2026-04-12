:- multifile signo/3.
:- discontiguous signo/3.
:- multifile video_youtube/2.
:- discontiguous video_youtube/2.

:- consult('src/prolog/saludos.pl').
:- consult('src/prolog/alimentos.pl').
:- consult('src/prolog/abecedario.pl').
:- consult('src/prolog/colores.pl').
:- consult('src/prolog/animales.pl').
:- consult('src/prolog/frases_comunes.pl').

sinonimo(madre, mama).
sinonimo(padre, papa).

buscar_signo(Palabra, SigID) :-
    signo(Palabra, _, SigID), !.
buscar_signo(Palabra, SigID) :-
    sinonimo(Palabra, Sinonimo),
    signo(Sinonimo, _, SigID), !.

buscar_categoria(Palabra, Categoria) :-
    signo(Palabra, Categoria, _), !.
buscar_categoria(Palabra, Categoria) :-
    sinonimo(Palabra, Sinonimo),
    signo(Sinonimo, Categoria, _), !.

buscar_youtube_video_por_signo(SigID, YoutubeRef) :-
    video_youtube(SigID, YoutubeRef), !.
