// Elementos do DOM
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const skillBars = document.querySelectorAll('.skill-bar');
const contactForm = document.querySelector('.contact-form');

// Menu mobile - Melhorado para dispositivos móveis
if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle das classes
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevenir scroll do body quando menu está aberto
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        // Debug para verificar se está funcionando
        console.log('Menu mobile:', navMenu.classList.contains('active') ? 'aberto' : 'fechado');
    });

    // Fechar menu ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            // Fechar menu mobile
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            
            // Se for link externo, permitir navegação normal
            if (link.getAttribute('href').startsWith('http')) {
                // Link externo - não fazer nada, deixar navegar normalmente
                return;
            }
            
            // Se for link interno, o smooth scroll já foi configurado acima
        });
    });
    
    // Fechar menu ao redimensionar a tela para desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Smooth scroll para links de navegação (apenas links internos)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Permitir que links externos funcionem normalmente
document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.addEventListener('click', function (e) {
        // Não interceptar links externos, deixar funcionar normalmente
        // Se quiser abrir em nova aba, adicione target="_blank" no HTML
    });
});

// Animação de scroll para elementos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplicar animação aos elementos
document.querySelectorAll('.work-item, .skill-category, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Animação das barras de habilidades
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBar = entry.target;
            const level = progressBar.getAttribute('data-level');
            progressBar.style.width = '0';
            setTimeout(() => {
                progressBar.style.width = level + '%';
            }, 500);
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => {
    skillObserver.observe(bar);
});

// Efeito de parallax para o background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const webglBg = document.querySelector('.webgl-background');
    if (webglBg) {
        webglBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Animação de contador para estatísticas
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Observador para animar contadores quando visíveis
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
            animateCounter(counter, target);
            counterObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(counter => {
    counterObserver.observe(counter);
});

// Efeito de hover para botões
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});







// Efeito de loading inicial
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Efeito de scroll suave para botões
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (this.textContent.includes('Projetos')) {
            e.preventDefault();
            // Simular navegação para projetos
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
            setTimeout(() => {
                this.innerHTML = '<span>Ver Projetos</span><i class="fas fa-arrow-right"></i>';
            }, 2000);
        }
    });
});

// Efeito de vibração para elementos importantes
function vibrate(element) {
    element.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Adicionar CSS para shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Aplicar vibração em elementos importantes quando visíveis
const importantElements = document.querySelectorAll('.hero-title, .section-title');
importantElements.forEach(element => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => vibrate(element), 500);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(element);
});

// Efeito de partículas no background
function createParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '2px';
    particle.style.height = '2px';
    particle.style.background = 'var(--primary-color)';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '-1';
    
    // Posição aleatória
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';
    
    document.body.appendChild(particle);
    
    // Animação
    const animation = particle.animate([
        { transform: 'translateY(0px)', opacity: 1 },
        { transform: `translateY(-${window.innerHeight}px)`, opacity: 0 }
    ], {
        duration: 3000 + Math.random() * 2000,
        easing: 'linear'
    });
    
    animation.onfinish = () => {
        particle.remove();
    };
}

// Criar partículas periodicamente
setInterval(createParticle, 200);



// Efeito de typing para o título
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Inicializar efeito de digitação quando a página carregar
window.addEventListener('load', () => {
    const titleLines = document.querySelectorAll('.title-line');
    titleLines.forEach((line, index) => {
        const originalText = line.textContent;
        setTimeout(() => {
            typeWriter(line, originalText, 50);
        }, 1000 + (index * 500));
    });
});

// Contador de Pessoas Online
function updateOnlineCounter() {
    const counterElement = document.getElementById('online-count');
    if (!counterElement) return;
    
    // Simular número base de pessoas online (entre 15 e 45)
    let baseCount = Math.floor(Math.random() * 31) + 15;
    
    // Adicionar variação aleatória ao longo do tempo
    setInterval(() => {
        const variation = Math.floor(Math.random() * 7) - 3; // -3 a +3
        const newCount = Math.max(10, baseCount + variation);
        counterElement.textContent = newCount;
        
        // Adicionar efeito de pulse quando o número muda
        counterElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            counterElement.style.transform = 'scale(1)';
        }, 200);
    }, 3000); // Atualizar a cada 3 segundos
    
    // Definir número inicial
    counterElement.textContent = baseCount;
}

// Inicializar contador quando a página carregar
document.addEventListener('DOMContentLoaded', updateOnlineCounter);

console.log('🚀 Alex Developer carregado com sucesso!');
console.log('💻 Sistema operacional: AlexDev v2.0');
console.log('🔒 Modo de segurança: ATIVO');
console.log('🎯 Missão: Desenvolver e proteger o futuro digital');

 