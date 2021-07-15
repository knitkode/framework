<div class="range formRoot {{ $classRoot ?? '' }}{{ isset($error) ? ' invalid' : '' }}">
  <input
    type="range"
    class="rangeInput {{ $classElement ?? '' }}"
    id="{{ $id ?? 'input-'.$name }}" 
    name="{{ $name }}"
    @isset($value)value="{{ $value }}"@endisset
    {!! $attrs ?? '' !!}
  >
</div>
