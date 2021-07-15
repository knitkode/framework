<div class="buttonset">
  @foreach($options as $option)  
    <input
      class="buttonsetInput"
      type="{{ $type ?? 'radio' }}"
      id="{{ $id ?? 'buttonset-'.$name.$loop->iteration }}" 
      name="{{ $name }}"
      value="{{ $option['value'] }}"
      @if(isset($checked) && $checked) checked @endif
      {{ isset($default) && $option['value'] == $default ? 'checked' : '' }}
      {!! $attrs ?? '' !!}
    >
    <label class="buttonsetBtn btn"
      for="{{ $id ?? 'buttonset-'.$name.$loop->iteration }}">
      {!! $option['label'] !!}
    </label>
  @endforeach
</div>