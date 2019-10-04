Для данного проекта была выбрана СУБД - MongoDB.
=====================
Почему она?
-----------------------------------
Данная СУБД легко маштабируемая за счёт отсутствия ограничений на структуре данных, что для данного приложения будет уместно, так как данная СУБД работает очень быстро на малой базе данных, но отлично работает на больших обьёмах данных, так же есть поддержка JSON формата данных, что в текущем приложении очень удобно можно будет использовать, на MongoDB, в случае необходимости, просто сделать шардинг.
***
Почему не MySQL(PostgreSQL)?
-----------------------------------
PostgreSQL так же подходит для данного приложения по всем её особенностям и характеристикам, но данную СУБД уместнее использовать на проектах, где необходимо будет проектирывать большую базу данных, с которой данная СУБД справится лучше MongoDB, но на PostgreSQL сложнее, чем на MongoDB, маштабировать БД.
