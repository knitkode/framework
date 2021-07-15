@if(isset($variant) && $variant === 'below')
<div class="swiper-navigation-wrap">
@endif
  <div class="swiper-navigation is-prev">
    @icon(['id' => 'angle-left'])
  </div>
  <div class="swiper-navigation is-next">
    @icon(['id' => 'angle-right'])
  </div>
@if(isset($variant) && $variant === 'below')
</div>
@endif
