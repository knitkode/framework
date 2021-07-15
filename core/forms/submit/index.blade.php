<button type="submit" class="btn {{ $classRoot ?? '' }} {{ $classElement ?? '' }}" {!! $attrs ?? '' !!}>
  {{ $label }}
  <span class="on-loading:show">
    <x-progress-circular :size="24"/>
  </span>
</button>
