/**
 * Team Block - Sekcja z zespołem ekspertów (Asymetryczny Układ)
 */
export const teamBlockHtml = `<section class="team-section relative overflow-hidden py-24 px-4 bg-background border-t border-border transition-colors duration-300">
  <!-- Dynamic glow backgrounds for rich aesthetic -->
  <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl pointer-events-none"></div>
  <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl pointer-events-none"></div>

  <div class="max-w-7xl mx-auto">
    <!-- Asymmetric 4-column Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 items-start">
      
      <!-- Column 1-2: Left Info Section (Row 1, Col 1 & 2) -->
      <div class="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-center h-full pr-0 lg:pr-8 py-4 self-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] tracking-wider uppercase mb-6 self-start shadow-sm">
          <svg class="w-3.5 h-3.5 text-primary animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span>{input-text:label:Tekst odznaki,default:Team Member}</span>
        </div>

        <!-- Heading -->
        <h2 class="text-3xl md:text-4xl lg:text-[44px] lg:leading-[1.15] font-black tracking-tight text-foreground mb-5">
          {input-text:label:Tytuł sekcji,default:Meet Our Professional Team Members}
        </h2>

        <!-- Description -->
        <p class="text-base text-muted-foreground leading-relaxed font-normal">
          {textarea:label:Opis sekcji,default:Sed ut perspiciatis unde omnis iste natus error sit volupta temes accusantium doloremque laudantium, totam rem}
        </p>
      </div>

      <!-- Member 1: Robert E. Whitmore (Row 1, Col 3) -->
      <div class="col-span-1 group flex flex-col w-full transition-all duration-300 hover:-translate-y-1.5">
        <!-- Rounded Image -->
        <div class="relative w-full aspect-[4/3] overflow-hidden rounded-[24px] bg-card border border-border/40 shadow-md">
          <img 
            src="{input-url:label:1. Zdjęcie (link),default:https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=450}" 
            alt="Robert E. Whitmore" 
            class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          >
        </div>
        <!-- Card details -->
        <div class="flex items-center justify-between mt-5 px-1">
          <div class="flex flex-col">
            <a href="{input-url:label:1. Profil (link),default:/eksperci}" class="text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors duration-300 tracking-tight leading-tight">
              {input-text:label:1. Imię i nazwisko,default:Robert E. Whitmore}
            </a>
            <span class="text-sm text-muted-foreground mt-1.5 font-medium">
              {input-text:label:1. Rola/Specjalizacja,default:Product Designer}
            </span>
          </div>
          <!-- Plus Icon -->
          <a href="{input-url:label:1. Profil (link),default:/eksperci}" class="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-180 transition-all duration-500 shadow-sm flex-shrink-0 ml-3" aria-label="Profil eksperta">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Member 2: Johnny M. Smith (Row 1, Col 4) -->
      <div class="col-span-1 group flex flex-col w-full transition-all duration-300 hover:-translate-y-1.5">
        <!-- Rounded Image -->
        <div class="relative w-full aspect-[4/3] overflow-hidden rounded-[24px] bg-card border border-border/40 shadow-md">
          <img 
            src="{input-url:label:2. Zdjęcie (link),default:https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=450}" 
            alt="Johnny M. Smith" 
            class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          >
        </div>
        <!-- Card details -->
        <div class="flex items-center justify-between mt-5 px-1">
          <div class="flex flex-col">
            <a href="{input-url:label:2. Profil (link),default:/eksperci}" class="text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors duration-300 tracking-tight leading-tight">
              {input-text:label:2. Imię i nazwisko,default:Johnny M. Smith}
            </a>
            <span class="text-sm text-muted-foreground mt-1.5 font-medium">
              {input-text:label:2. Rola/Specjalizacja,default:IT Consultant}
            </span>
          </div>
          <!-- Plus Icon -->
          <a href="{input-url:label:2. Profil (link),default:/eksperci}" class="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-180 transition-all duration-500 shadow-sm flex-shrink-0 ml-3" aria-label="Profil eksperta">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Member 3: Angelo H. Tomlin (Row 2, Col 1) -->
      <div class="col-span-1 group flex flex-col w-full transition-all duration-300 hover:-translate-y-1.5">
        <!-- Rounded Image -->
        <div class="relative w-full aspect-[4/3] overflow-hidden rounded-[24px] bg-card border border-border/40 shadow-md">
          <img 
            src="{input-url:label:3. Zdjęcie (link),default:https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=450}" 
            alt="Angelo H. Tomlin" 
            class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          >
        </div>
        <!-- Card details -->
        <div class="flex items-center justify-between mt-5 px-1">
          <div class="flex flex-col">
            <a href="{input-url:label:3. Profil (link),default:/eksperci}" class="text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors duration-300 tracking-tight leading-tight">
              {input-text:label:3. Imię i nazwisko,default:Angelo H. Tomlin}
            </a>
            <span class="text-sm text-muted-foreground mt-1.5 font-medium">
              {input-text:label:3. Rola/Specjalizacja,default:Senior Manager}
            </span>
          </div>
          <!-- Plus Icon -->
          <a href="{input-url:label:3. Profil (link),default:/eksperci}" class="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-180 transition-all duration-500 shadow-sm flex-shrink-0 ml-3" aria-label="Profil eksperta">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Member 4: Robert E. Whitmore 2 (Row 2, Col 2) -->
      <div class="col-span-1 group flex flex-col w-full transition-all duration-300 hover:-translate-y-1.5">
        <!-- Rounded Image -->
        <div class="relative w-full aspect-[4/3] overflow-hidden rounded-[24px] bg-card border border-border/40 shadow-md">
          <img 
            src="{input-url:label:4. Zdjęcie (link),default:https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600&h=450}" 
            alt="Robert E. Whitmore" 
            class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          >
        </div>
        <!-- Card details -->
        <div class="flex items-center justify-between mt-5 px-1">
          <div class="flex flex-col">
            <a href="{input-url:label:4. Profil (link),default:/eksperci}" class="text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors duration-300 tracking-tight leading-tight">
              {input-text:label:4. Imię i nazwisko,default:Robert E. Whitmore}
            </a>
            <span class="text-sm text-muted-foreground mt-1.5 font-medium">
              {input-text:label:4. Rola/Specjalizacja,default:Web Designer}
            </span>
          </div>
          <!-- Plus Icon -->
          <a href="{input-url:label:4. Profil (link),default:/eksperci}" class="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-180 transition-all duration-500 shadow-sm flex-shrink-0 ml-3" aria-label="Profil eksperta">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Member 5: Manuel G. Wilmer (Row 2, Col 3) -->
      <div class="col-span-1 group flex flex-col w-full transition-all duration-300 hover:-translate-y-1.5">
        <!-- Rounded Image -->
        <div class="relative w-full aspect-[4/3] overflow-hidden rounded-[24px] bg-card border border-border/40 shadow-md">
          <img 
            src="{input-url:label:5. Zdjęcie (link),default:https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600&h=450}" 
            alt="Manuel G. Wilmer" 
            class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          >
        </div>
        <!-- Card details -->
        <div class="flex items-center justify-between mt-5 px-1">
          <div class="flex flex-col">
            <a href="{input-url:label:5. Profil (link),default:/eksperci}" class="text-lg md:text-xl font-bold text-foreground hover:text-primary transition-colors duration-300 tracking-tight leading-tight">
              {input-text:label:5. Imię i nazwisko,default:Manuel G. Wilmer}
            </a>
            <span class="text-sm text-muted-foreground mt-1.5 font-medium">
              {input-text:label:5. Rola/Specjalizacja,default:CEO & Founder}
            </span>
          </div>
          <!-- Plus Icon -->
          <a href="{input-url:label:5. Profil (link),default:/eksperci}" class="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-180 transition-all duration-500 shadow-sm flex-shrink-0 ml-3" aria-label="Profil eksperta">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Column 4 of Row 2: Centered CTA Button -->
      <div class="col-span-1 flex items-center justify-center h-full min-h-[160px] md:min-h-0 py-6 lg:py-0 lg:self-center">
        <a 
          href="{input-url:label:Przycisk - Link,default:/eksperci}" 
          class="group/btn relative inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-bold text-sm tracking-wider uppercase rounded-xl hover:bg-primary/95 hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-primary/20 cursor-pointer overflow-hidden"
        >
          <!-- Shiny animation layer -->
          <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></span>
          <span>{input-text:label:Przycisk - Tekst,default:View More Members}</span>
        </a>
      </div>

    </div>
  </div>

  <!-- Inline CSS Keyframe for Shimmer Animation -->
  <style>
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
  </style>
</section>`;

