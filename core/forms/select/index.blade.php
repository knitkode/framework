@php
  $_value = old($name) ?? $value ?? null;
@endphp
<div class="select formRoot {{ $classRoot ?? '' }}{{ $errors->has($name) ? ' invalid' : '' }}">
  <div class="formBox">
    <select
      class="formControl"
      id="{{ $id ?? 'input-'.$name }}" 
      name="{{ $name }}"
      @isset($required) required="required"@endisset
      @if(isset($disabled) && $disabled) disabled @endif
      {!! $attrs ?? '' !!}
    >
      @if(isset($placeholder) && $placeholder)
        <option value="" label="">
          {{ $placeholder }}
        </option>
      @elseif(!isset($noEmpty) || (isset($noEmpty) && !$noEmpty))
        <option value="" label=""></option>
      @endif
      @foreach($options as $option)
        <option
          class="selectOption"
          value="{{ $option['value'] }}"
          {{ !is_null($_value) && $option['value'] == $_value ? 'selected' : '' }}
          {!! $option['attrs'] ?? '' !!}
        >
          {!! $option['label'] ?? $option['key'] !!}
        </option>
      @endforeach
    </select>
    <i class="selectArrow"></i>
    <span class="formUnderline"></span>
    @isset($label)
      <label for="{{ $id ?? 'input-'.$name }}" class="formLabel">
        {!! $label !!}
      </label>
    @endisset
    @if($errors->has($name))<div class="formFeedback">{{ $errors->first($name) }}</div>@endif
  </div>
</div>
