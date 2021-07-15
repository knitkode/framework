@props([
  'id' => '',
  'class' => '',
  'attrs' => '',
])
<span class="iconCircle {{ $class }}" {!! $attrs !!}>
  <svg class="icon icon-{{ $id }}">
    <use xlink:href="#sprite-{{ $id }}"></use>
  </svg>
</span>
