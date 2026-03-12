CC = gcc
CFLAGS = -g

folder = build

all: mk_folder gr_op

mk_folder:
	mkdir -p $(folder)

gr_op: mk_folder
	$(CC) graphic_optimization.c -o $(folder)/gr_op $(CFLAGS)
