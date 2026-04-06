:- consult('knowledge_base.pl').

sinonimo(hola, saludo).
sinonimo(adios, despedida).
sinonimo(madre, mama).
sinonimo(padre, papa).
sinonimo(agua, liquido).
sinonimo(comida, alimento).
sinonimo(bano, inodoro).
sinonimo(enfermo, enfermedad).
sinonimo(dormir, sueno).
sinonimo(manana, futuro).

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

listar_categoria_signos(Categoria, Signos) :-
    findall(Palabra, signo(Palabra, Categoria, _), Signos).

obtener_id_signo(Palabra, ID) :-
    signo(Palabra, _, ID), !.
obtener_id_signo(Palabra, ID) :-
    sinonimo(Palabra, Sinonimo),
    signo(Sinonimo, _, ID), !.

todos_los_signos(Signos) :-
    findall(sig(Palabra, Categoria, ID), signo(Palabra, Categoria, ID), Signos).
