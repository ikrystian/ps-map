// Kod bannera Klubu Partnerskiego do wklejenia na stronie eksperta — czyste funkcje,
// bezpieczne w komponentach klienckich (lib/partner-program.ts importuje Prismę).

/**
 * Generuje HTML kod bannera dla ekspertów
 */
export function generateBannerHtml(bannerCode: string): string {
  return `<!-- ProstaSprawa Partner Banner -->
<div id="${bannerCode}" class="ps-partner-banner">
  <a href="https://prostasprawa.pl" target="_blank" rel="noopener">
    <img src="https://prostasprawa.pl/images/public/banner.png" alt="Partnerzy ProstaSprawa.pl" />
  </a>
</div>
<!-- /ProstaSprawa Partner Banner -->`
}

/**
 * Generuje kod JavaScript bannera (alternatywny sposób)
 */
export function generateBannerScript(bannerCode: string): string {
  return `<!-- ProstaSprawa Partner Banner Script -->
<script>
(function() {
  var banner = document.createElement('div');
  banner.id = '${bannerCode}';
  banner.className = 'ps-partner-banner';
  banner.innerHTML = '<a href="https://prostasprawa.pl" target="_blank" rel="noopener"><img src="https://prostasprawa.pl/images/public/banner.png" alt="Partnerzy ProstaSprawa.pl" /></a>';
  document.body.appendChild(banner);
})();
</script>
<!-- /ProstaSprawa Partner Banner Script -->`
}
