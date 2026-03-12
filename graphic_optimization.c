#include <stdio.h> 
#include <math.h> 

/* T(r) = 0.5*r^2 + 2*r + 5 */ 
float proc_time(float r) { 
	return 0.5 * (r * r) + 2.0 * r + 5.0; 
} 

/* derivada de primeira ordem */ 
float df_proc_time(float r) { 
	return r + 2.0; 
}

/* método de newton-raphson, para encontrar raízes, no nosso caso: de f(r) = T(r) - 16.67 */
float newton_raphson(float fps_target) {
    float limite_tempo = 1000.0 / fps_target;
    float r = 2.0;  /* estimativa */
    float tolerancia = 0.0001;
    
    int max_i = 20;
    
    printf("alvo: %.2f ms (%.0f FPS)\n\n", limite_tempo, fps_target);
    
    for (int i=0; i < max_i; i++) {
        float f = proc_time(r) - limite_tempo;  /* f(r) = T(r) - limite */
        float df = df_proc_time(r); /* f'(r) = T'(r) */
        float r_novo = r - (f / df);
        
        printf("index = %d: r = %.6f, T(r) = %.4f ms, erro = %.6f\n",
               i + 1, r, proc_time(r), fabs(r_novo - r));
        
        if (fabs(r_novo - r) < tolerancia) {
            r = r_novo;
            break;
        }
        r = r_novo;
    }
    return r;
}

int main(void) {
	newton_raphson(60);
	return 0;
}
