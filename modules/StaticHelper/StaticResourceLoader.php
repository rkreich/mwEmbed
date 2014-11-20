<?php


class StaticResourceLoader extends MwEmbedResourceLoader
{
    public function getModule($name)
    {
        /*if (isset($this->moduleInfos[$name])) {
            $this->moduleInfos[$name]['debugRaw'] = false;
        }*/
        return parent::getModule($name);
    }
}