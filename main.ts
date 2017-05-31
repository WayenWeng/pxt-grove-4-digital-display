
let TubeTab: number [] = [0x3f,0x06,0x5b,0x4f,0x66,0x6d,0x7d,0x07,0x7f,0x6f,0x77,0x7c,0x39,0x5e,0x79,0x71] // 0~9,A,b,C,d,E,F

/**
 * Point display switch
 */
enum PointMode {
    //% block=ON
    POINT_ON = 1,
    //% block=OFF
    POINT_OFF = 0
}

/**
 * Display brightness level
 */
enum BrightnessLevel {
    //% block=LV0
    LEVEL_0 = 0,
    //% block=LV1
    LEVEL_1 = 1,
    //% block=LV2
    LEVEL_2 = 2,
    //% block=LV3
    LEVEL_3 = 3,
    //% block=LV4
    LEVEL_4 = 4,
    //% block=LV5
    LEVEL_5 = 5,
    //% block=LV6
    LEVEL_6 = 6,
    //% block=LV7
    LEVEL_7 = 7
}

/**
 * Functions to operate Grove 4 Digital Display module.
 */
//% weight=10 color=#9F79EE icon="\uf108"
namespace Grove_4_Digital_Display
{
    export class TM1637
    {
        clkPin: DigitalPin;
        dataPin: DigitalPin;
        brightnessLevel: BrightnessLevel;     
        pointFlag: PointMode;

        private writeByte(wrData: number) 
        {
            for(let i = 0; i < 8; i ++)
            {
                pins.digitalWritePin(this.clkPin, 0);
                if(wrData & 0x01)pins.digitalWritePin(this.dataPin, 1);
                else pins.digitalWritePin(this.dataPin, 0);
                wrData >>= 1;
                pins.digitalWritePin(this.clkPin, 1);
            }
            
            pins.digitalWritePin(this.clkPin, 0); // Wait for ACK
            pins.digitalWritePin(this.dataPin, 1);
            pins.digitalWritePin(this.clkPin, 1);
        }
        
        private start()
        {
            pins.digitalWritePin(this.clkPin, 1);
            pins.digitalWritePin(this.dataPin, 1);
            pins.digitalWritePin(this.dataPin, 0);
            pins.digitalWritePin(this.clkPin, 0);
        }
        
        private stop()
        {
            pins.digitalWritePin(this.clkPin, 0);
            pins.digitalWritePin(this.dataPin, 0);
            pins.digitalWritePin(this.clkPin, 1);
            pins.digitalWritePin(this.dataPin, 1);
        }
        
        private coding(dispData: number): number
        {
            let pointData = 0;
            
            if(this.pointFlag == PointMode.POINT_ON)pointData = 0x80;
            else if(this.pointFlag == PointMode.POINT_OFF)pointData = 0;
            
            if(dispData == 0x7f)dispData = 0x00 + pointData;
            else dispData = TubeTab[dispData] + pointData;
            
            return dispData;
        } 

        /**
         * Show a 4 bit number on display
         * @param dispData value of number
         */
        //% blockId=tm1637_display_number block="%strip|dispData %dispData"
        show(dispData: number)
        {       
            if(dispData < 10)
            {
                this.bit(3, dispData);
                this.bit(2, 0x7f);
                this.bit(1, 0x7f);
                this.bit(0, 0x7f);
            }
            else if(dispData < 100)
            {
                this.bit(3, dispData % 10);
                this.bit(2, (dispData / 10) % 10);
                this.bit(1, 0x7f);
                this.bit(0, 0x7f);
            }
            else if(dispData < 1000)
            {
                this.bit(3, dispData % 10);
                this.bit(2, (dispData / 10) % 10);
                this.bit(1, (dispData / 100) % 10);
                this.bit(0, 0x7f);
            }
            else
            {
                this.bit(3, dispData % 10);
                this.bit(2, (dispData / 10) % 10);
                this.bit(1, (dispData / 100) % 10);
                this.bit(0, (dispData / 1000) % 10);
            }
        }
        
        /**
         * Set brightness level to display
         * @param level value of brightness level
         */
        //% blockId=tm1637_set_display_level block="%strip|level %level"
        set(level: BrightnessLevel)
        {
            this.brightnessLevel = level;
        }
        
        /**
         * Show a 1 bit number on display
         * @param bitAddr value of bit number
         * @param dispData value of number
         */
        //% blockId=tm1637_display_bit block="%strip|bitAddr %bitAddr|dispData %dispData"
        //% parts="Grove_4_Digital_Display" advanced=true
        bit(bitAddr: number, dispData: number)
        {
            let segData = 0;
            segData = this.coding(dispData);
            this.start();
            this.writeByte(0x44);
            this.stop();
            this.start();
            this.writeByte(bitAddr | 0xc0);
            this.writeByte(segData);
            this.stop();
            this.start();
            this.writeByte(0x88 + this.brightnessLevel);
            this.stop();
        }
        
        /**
         * On or off point display
         * @param pointEn value of point switch
         */
        //% blockId=tm1637_display_point block="%strip|pointEn %pointEn"
        //% parts="Grove_4_Digital_Display" advanced=true
        point(pointEn: PointMode)
        {
            this.pointFlag = pointEn;
        }
        
        /**
         * Clear display
         */
        //% blockId=tm1637_display_clear
        //% parts="Grove_4_Digital_Display" advanced=true
        clear()
        {
            this.bit(0x00, 0x7f);
            this.bit(0x01, 0x7f);
            this.bit(0x02, 0x7f);
            this.bit(0x03, 0x7f);
        }
    }
    
    /**
     * Create a new TM1637 driver for 4 digital display
     * @param clkPin value of clk pin number
     * @param dataPin value of data pin number
     */
    //% blockId=tm1637_create block="create clkPin %clkPin|dataPin %dataPin"
    export function create(clkPin: DigitalPin, dataPin: DigitalPin): TM1637
    {
        let display = new TM1637();
        
        display.clkPin = clkPin;
        display.dataPin = dataPin;
        display.brightnessLevel = BrightnessLevel.LEVEL_0;
        display.pointFlag = PointMode.POINT_OFF;
        
        return display;
    }
}