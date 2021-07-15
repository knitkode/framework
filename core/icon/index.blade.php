@props([
  'id' => '',
])
<svg {{ $attributes->merge([ 'class' => 'icon icon-'.$id ]) }}>
  <use xlink:href="#{{ $id }}"></use>
</svg>
