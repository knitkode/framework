@php
  $_value = old($name) ?? $value ?? null;
@endphp
<div class="radio formRoot {{ $classRoot ?? '' }}{{ $errors->has($name) ? ' invalid' : '' }}" {!! $attrsRoot ?? '' !!}>
  @isset($label)
  <label class="radioLabel">
    {!! $label !!}
  </label>
  @endisset
  @foreach($options as $option)  
    <div class="formToggle">
      <input
        class="formControl"
        type="{{ $type ?? 'radio' }}"
        id="{{ $id ?? 'input-'.$name }}--{{ $loop->iteration }}" 
        name="{{ $name }}"
        value="{{ $option['value'] }}"
        {{ !empty($_value) && ($_value === true || $option['value'] == $_value) ? 'checked' : '' }}
        @isset($required) required="required"@endisset
        {!! $attrs ?? '' !!}
      >
      <label class="label" for="{{ $id ?? 'input-'.$name }}--{{ $loop->iteration }}">
        <dfn class="dfn"></dfn>
        <span class="formToggleLabel radioValue">
          {{ $optionPrepend ?? '' }}
          {!! $option['label'] ?? $option['key'] !!}
          {{ $optionAppend ?? '' }}
        </span>
      </label>
    </div>
  @endforeach
  {{ $slot ?? '' }}
  @if($errors->has($name))<div class="formFeedback">{{ $errors->first($name) }}</div>@endif
</div>
