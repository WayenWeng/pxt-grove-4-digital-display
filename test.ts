{
    let display = Grove_4_Digital_Display.create(DigitalPin.P0, DigitalPin.P1);
    let data = 0;
    
    display.point(PointMode.POINT_ON);
    display.clear();
    display.bit(3, 3);
    basic.pause(500);
    
    display.point(PointMode.POINT_OFF);
    display.clear();
    display.bit(2, 2);
    basic.pause(500);
    
    display.point(PointMode.POINT_ON);
    display.clear();
    display.bit(1, 1);
    basic.pause(500);
    
    display.point(PointMode.POINT_OFF);
    display.clear();
    display.bit(0, 0);
    basic.pause(500);
    
    display.set(BrightnessLevel.LEVEL_7);
    while(true)
    {
        display.show(data ++);
        basic.pause(500);
    }
}