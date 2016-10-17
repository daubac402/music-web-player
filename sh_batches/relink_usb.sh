sudo umount -l /media/usb
sudo mount /dev/sda1 /media/usb
ln -f -s /media/usb/music-web-player/Musics/* /var/www/html/music-web-player/Musics/