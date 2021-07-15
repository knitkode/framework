@php
  $isInlineMode = isset($inlineToggle) && $inlineToggle;
  $tag = $isInlineMode ? 'span' : 'div';
@endphp
<div class="expander {{ $classRoot ?? '' }}" expander>
  @if($isInlineMode)<div class="expanderBody" expander-body>@endif
    <{{ $tag }}@if(!$isInlineMode) class="expanderBody" expander-body @endif>
      {{ $slot }}
      <span expander-more>@isset($isInlineMode)... @endisset</span>
    </{{ $tag }}>
  @if($isInlineMode)</div>@endif
  @if(isset($toggle))
    {{ $toggle }}
  @else
    <div class="expanderToggle" expander-toggle>
      @isset($more)
        <span expander-more>{!! $more !!}</span>
      @endisset
      @isset($less)
        <span expander-less>{!! $less !!}</span>
      @endisset
    </div>
  @endif
</div>