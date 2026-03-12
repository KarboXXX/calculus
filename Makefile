CC = gcc
CFLAGS = -g

folder = build

all: gr_op

gr_op:
	$(CC) graphic_optimization.c -o $(folder)/gr_op $(CFLAGS)
