#include <Arduino.h>

#include "config.h"
#include "debug.h"
#include "duckscript.h"
#include "duckparser.h"
#include "webserver.h"
#include "spiffs.h"
#include "settings.h"
#include "cli.h"
#include "USB.h"

#include "espasyncbutton.hpp"

#define BUTTON_1 GPIO_NUM_0

AsyncEventButton b1(BUTTON_1, LOW);

void on_press(){
    duckscript::run(settings::getAutorun());
}



void setup() {
    debug_init();
    duckparser::beginKeyboard();
    USB.begin();
    delay(200);
    spiffs::begin();
    settings::begin();
    cli::begin();
    webserver::begin();

    /* duckscript::run(settings::getAutorun()); */

    b1.begin();
    b1.onClick(on_press);

    b1.enable();
    delay(200);

}

void loop() {
    webserver::update();
    debug_update();
}