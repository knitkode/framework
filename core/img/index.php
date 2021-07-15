<?php

namespace resources\components;

use Illuminate\View\Component;
use LaravelFrontend\Img\Img as ImgService;
use Illuminate\Support\Str;

class Img extends Component
{
    public $img;
    public $compression;
    public $original;
    public $tag;
    public $href;
    public $alt;
    public $immediate;
    public $thumb;
    public $fixed;
    public $bgColor;
    public $cage;
    public $cssFit;
    public $progress;
    public $attrsRoot;
    public $attrs;

    /**
     * Create a new component instance.
     *
     * @return void
     */
    public function __construct(
        // img service needed params
        string $src = '',
        bool $local = false,
        bool $original = false,
        int $compression = null,
        int $compressionWebp = null,
        int $width = 0,
        int $height = 0,
        string $fit = '',
        string $position = '',
        bool $greyscale = false,
        string $colorize = '',
        // this core component specific options
        string $tag = 'span',
        string $href = '',
        string $alt = '',
        bool $immediate = false,
        bool $thumb = true,
        bool $fixed = false,
        string $bgColor = '',
        bool $cage = true,
        string $cssFit = 'cover',
        bool $progress = false,
        string $attrsRoot = '',
        string $attrs = ''
    ) {
        $img = new ImgService($src, [
            'local' => $local,
            'original' => $original,
            'compression' => $compression,
            'compressionWebp' => $compressionWebp,
            'w' => $width,
            'h' => $height,
            'fit' => $fit,
            'position' => $position,
            'greyscale' => $greyscale,
            'colorize' => $colorize,
        ]);

        $this->img = $img->getMeta();
        $this->tag = $href ? 'a' : $tag;
        $this->href = $href;
        $this->alt = $alt;
        $this->immediate = $immediate;
        $this->thumb =
            $thumb && $this->img['thumb']
                ? $this->img['thumb']
                : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
        $this->fixed = $fixed;
        $this->bgColor = $bgColor;
        $this->cage = $cage;
        $this->cssFit = $cssFit;
        $this->progress = $progress;
        $this->attrsRoot = $attrsRoot;
        $this->attrs = $attrs;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\View\View|string
     */
    public function render()
    {
        return view('components.img');
    }
}
