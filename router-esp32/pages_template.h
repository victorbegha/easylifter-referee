/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/
#ifndef PAGES_H
#define PAGES_H

#include "Arduino.h"

/* Generate pages.h from this file by running "tools/inoCodeGenerator/automate.js" */

class Pages
{
  public:
    Pages();
    const String menu = <<<MENUHTML>>>;
    const String referee = <<<REFEREEHTML>>>;
};

Pages::Pages()
{

}

#endif