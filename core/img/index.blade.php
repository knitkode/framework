<{{ $tag }}@if($href) href="{{ $href }}"@endif {{ $attributes->merge(['class' => 'media media--img']) }} style="
    @if($bgColor)background:{{ $bgColor }};@endif
    @if(!$cage && $fixed)width:{{$img['width']}}px @elseif($fixed)max-width:{{$img['width']}}px;@else width:100%;@endif
    {!! $styles ?? '' !!}" {!! $attrsRoot ?? '' !!}
>
  <noscript>
    <img draggable="false" class="mediaElement img fit-{{ $cssFit }}"
      alt="{{ $alt ?? $img['name'] ?? '' }}"
      src="{{ $img['url'] }}" 
      width="{{ $img['width'] }}"
      height="{{ $img['height'] }}"
      {!! $attrs ?? '' !!}
    >
  </noscript>
  @if($cage)<span class="mediaProportion" style="padding-top:{{ $img['ratio'] }}%"></span>@endif
  <picture @if($cage)class="mediaCenterer"@endif>
    @if ($img['urlWebp'])
      <source type="image/webp"
        srcset="{{ $immediate ? $img['urlWebp'] : $thumb }}"
        @if(!$immediate) data-srcset="{{ $img['urlWebp'] }}"@endif 
      >
    @endif
    <img draggable="false" class="mediaElement img fit-{{ $cssFit }}@unless($immediate) lazy @endunless"
      alt="{{ $alt ?? $img['name'] ?? '' }}"
      src="{{ $immediate ? $img['url'] : $thumb }}"
      @unless($immediate) data-src="{{ $img['url'] }}" @endunless
      width="{{ $img['width'] }}"
      height="{{ $img['height'] }}"
      {!! $attrs ?? '' !!}
    >
  </picture>
  @if(isset($progress) && $progress))
    <x-progress-circular :size="$progress" center="true"/>
  @endif
  @isset($mask)
    <canvas class="mediaMask" {!! $attrsMask ?? '' !!}></canvas>
  @endisset
  {{ $append ?? ''}}
</{{ $tag }}>
