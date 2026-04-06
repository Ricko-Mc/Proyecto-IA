signo(hola, saludos, 's001').
signo(adios, saludos, 's002').
signo(buenos_dias, saludos, 's003').
signo(buenas_noches, saludos, 's004').
signo(buenas_tardes, saludos, 's005').
signo(gracias, saludos, 's006').
signo(de_nada, saludos, 's007').
signo(por_favor, saludos, 's008').
signo(disculpe, saludos, 's009').
signo(mucho_gusto, saludos, 's010').

signo(madre, familia, 's101').
signo(padre, familia, 's102').
signo(hermano, familia, 's103').
signo(hermana, familia, 's104').
signo(abuelo, familia, 's105').
signo(abuela, familia, 's106').
signo(tio, familia, 's107').
signo(tia, familia, 's108').
signo(primo, familia, 's109').
signo(prima, familia, 's110').

signo(uno, numeros, 's201').
signo(dos, numeros, 's202').
signo(tres, numeros, 's203').
signo(cuatro, numeros, 's204').
signo(cinco, numeros, 's205').
signo(seis, numeros, 's206').
signo(siete, numeros, 's207').
signo(ocho, numeros, 's208').
signo(nueve, numeros, 's209').
signo(diez, numeros, 's210').

signo(rojo, colores, 's301').
signo(azul, colores, 's302').
signo(verde, colores, 's303').
signo(amarillo, colores, 's304').
signo(blanco, colores, 's305').
signo(negro, colores, 's306').
signo(morado, colores, 's307').
signo(rosa, colores, 's308').
signo(naranja, colores, 's309').
signo(gris, colores, 's310').

signo(agua, necesidades, 's401').
signo(comida, necesidades, 's402').
signo(bano, necesidades, 's403').
signo(ayuda, necesidades, 's404').
signo(enfermo, necesidades, 's405').
signo(dolor, necesidades, 's406').
signo(medicina, necesidades, 's407').
signo(dormir, necesidades, 's408').
signo(descanso, necesidades, 's409').
signo(trabajo, necesidades, 's410').

signo(hoy, tiempo, 's501').
signo(manana, tiempo, 's502').
signo(ayer, tiempo, 's503').
signo(ahora, tiempo, 's504').
signo(hora, tiempo, 's505').
signo(dia, tiempo, 's506').
signo(noche, tiempo, 's507').
signo(semana, tiempo, 's508').
signo(mes, tiempo, 's509').
signo(ano, tiempo, 's510').

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
