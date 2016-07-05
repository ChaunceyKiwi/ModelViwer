#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <iostream>
#include <fstream>
#include <string>
using namespace std;


void processFile(char* addr);

int main(int argc, char *argv[])
{
    if (argc > 1 && *(argv[1]) == '-') {
        printf("Wrong format\n");
        exit(1);
    }

    int listenPort = 1234;
    if (argc > 1)
        listenPort = atoi(argv[1]);

    // Create a socket
    int s0 = socket(AF_INET, SOCK_STREAM, 0);
    if (s0 < 0) {
        perror("Cannot create a socket"); exit(1);
    }

    // Fill in the address structure containing self address
    struct sockaddr_in myaddr;
    memset(&myaddr, 0, sizeof(struct sockaddr_in));
    myaddr.sin_family = AF_INET;
    myaddr.sin_port = htons(listenPort);        // Port to listen
    myaddr.sin_addr.s_addr = htonl(INADDR_ANY);

    // Bind a socket to the address
    int res = bind(s0, (struct sockaddr*) &myaddr, sizeof(myaddr));
    if (res < 0) {
        perror("Cannot bind a socket"); exit(1);
    }

    // Set the "LINGER" timeout to zero, to close the listen socket
    // immediately at program termination.
    struct linger linger_opt = { 1, 0 }; // Linger active, timeout 0
    setsockopt(s0, SOL_SOCKET, SO_LINGER, &linger_opt, sizeof(linger_opt));

    // Now, listen for a connection
    res = listen(s0, 1);    // "1" is the maximal length of the queue
    if (res < 0) {
        perror("Cannot listen");
        exit(1);
    }

    // Accept a connection (the "accept" command waits for a connection with
    // no timeout limit...)
    struct sockaddr_in peeraddr;
    socklen_t peeraddr_len;
    int s1 = accept(s0, (struct sockaddr*) &peeraddr, &peeraddr_len);
    if (s1 < 0) {
        perror("Cannot accept");
        exit(1);
    }

    while(1){
        char buffer[1024];
        res = read(s1, buffer, 1023);
        if (res < 0) {
            perror("Read error"); exit(1);
        }else if(res > 0){
            buffer[res] = 0;
            printf("Received %d bytes:\n%s\n", res, buffer);
            // processFile(buffer);
            write(s1, "Done! Click next to show result.", 5);
        }
    }

    res = close(s0);    // Close the listen socket
    close(s1);          // Close the data socket
    return 0;
}

void processFile(char* addr){
  string line;
  ifstream myfile (addr);
  if (myfile.is_open())
  {
    while ( getline (myfile,line) )
    {
      cout << line << '\n';
    }
    myfile.close();
  }else
    cout << "Unable to open file";
}
